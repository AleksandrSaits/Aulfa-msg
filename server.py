import json
import os
from datetime import datetime
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

app = FastAPI(title="Web Messenger")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.history: List[dict] = []

    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        self.active_connections.append(websocket)
        for msg in self.history[-50:]:
            await websocket.send_text(json.dumps(msg, ensure_ascii=False))
        await self.broadcast({
            "type": "system",
            "text": f"{username} присоединился к чату"
        })

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        if message.get("type") == "chat":
            self.history.append(message)
            if len(self.history) > 200:
                self.history.pop(0)
        payload = json.dumps(message, ensure_ascii=False)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                pass

manager = ConnectionManager()

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.websocket("/ws/{username}")
async def websocket_endpoint(websocket: WebSocket, username: str):
    await manager.connect(websocket, username)
    try:
        while True:
            raw_data = await websocket.receive_text()
            data = json.loads(raw_data)
            text = data.get("text", "").strip()
            if text:
                msg = {
                    "type": "chat",
                    "sender": username,
                    "text": text,
                    "time": datetime.now().strftime("%H:%M")
                }
                await manager.broadcast(msg)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast({
            "type": "system",
            "text": f"{username} покинул чат"
        })

app.mount("/static", StaticFiles(directory="."), name="static")

@app.get("/")
async def get_index():
    return FileResponse("index.html")

@app.get("/{filename}")
async def get_static_file(filename: str):
    if filename in ["style.css", "app.js"]:
        return FileResponse(filename)
    return FileResponse("index.html")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
