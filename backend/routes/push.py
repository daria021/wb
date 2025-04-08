from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request

router = APIRouter(
    prefix="/push",
    tags=["Push"]
)

@router.get()
async def get_pushes():
    ...

async def create_push():
    ...