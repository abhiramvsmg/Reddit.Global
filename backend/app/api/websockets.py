from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List
import json
import logging

logger = logging.getLogger("app")
router = APIRouter(tags=["websockets"])

class ConnectionManager:
    def __init__(self):
        # user_id -> list of websockets
        self.active_connections: Dict[int, List[WebSocket]] = {}
        # broadcast connections
        self.broadcast_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, user_id: int | None = None):
        await websocket.accept()
        if user_id:
            if user_id not in self.active_connections:
                self.active_connections[user_id] = []
            self.active_connections[user_id].append(websocket)
        else:
            self.broadcast_connections.append(websocket)
        logger.info(f"WebSocket connected: user_id={user_id}")

    def disconnect(self, websocket: WebSocket, user_id: int | None = None):
        if user_id and user_id in self.active_connections:
            self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        elif websocket in self.broadcast_connections:
            self.broadcast_connections.remove(websocket)
        logger.info(f"WebSocket disconnected: user_id={user_id}")

    async def send_personal_message(self, message: dict, user_id: int):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                await connection.send_json(message)

    async def broadcast(self, message: dict):
        # Send to all users and broadcast listeners
        for connections in self.active_connections.values():
            for connection in connections:
                await connection.send_json(message)
        for connection in self.broadcast_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    # In production, we would verify the JWT here
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            logger.info(f"WebSocket message from {user_id}: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)

@router.websocket("/ws/broadcast")
async def broadcast_websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
