'use client';

import React, {useEffect, useReducer, useRef, useState} from "react";
import {globalStateReducer, PlayerAction, PlayerState, GamePhase, initialState} from "@/app/game";

export default function Home() {
    const view = {height: 600, width: 800};
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [slimeImage, setSlimeImage] = useState<HTMLImageElement | null>(null)
    const [effectImage, setEffectImage] = useState<HTMLImageElement | null>(null)
    const [globalState, dispatchEvent] = useReducer(globalStateReducer, { ...initialState, drawHandler: drawDamageEffect })

    function drawActions(ctx: CanvasRenderingContext2D, selectedAction: PlayerAction) {
        ctx.strokeRect(180, 400, 150, 180)
        if (selectedAction === PlayerAction.Fight) {
            ctx.fillText('▶', 185, 450)
        }
        ctx.fillText('たたかう', 210, 450)

        if (selectedAction === PlayerAction.Escape) {
            ctx.fillText('▶', 185, 500)
        }
        ctx.fillText('にげる', 210, 500)
    }

    // 長いメッセージを400px幅で改行して表示する
    function drawMessage(ctx: CanvasRenderingContext2D, message: string) {
        const lines = []
        message.split('\n').forEach((line, index) => {
            ctx.fillText(line, 200, 440 + (index * 30))
        })
    }

    function drawPlayerHealth(ctx: CanvasRenderingContext2D, playerHealth: number, playerInitialHealth: number) {
        ctx.strokeRect(180, 50, 440, 50)
        if (playerHealth <= playerInitialHealth / 2) {
            ctx.fillStyle = 'red'
        } else {
            ctx.fillStyle = 'green'
        }
        ctx.fillRect(180, 50, 440 * playerHealth / playerInitialHealth, 50)
        ctx.fillStyle = 'white'
        ctx.fillText('ゆうしゃ', 190, 84)
        ctx.fillText(`${playerHealth}/${playerInitialHealth}`, 510, 84)
    }

    function drawDamageEffect() {
        // const actx = new AudioContext();
        const audioElement = new Audio('/attack.mp3')
        audioElement.play()
        const canvas = canvasRef?.current
        const ctx = canvas?.getContext('2d')!
        const image = new Image()
        image.src = '/effect.png'
        image.onload = () => {
            ctx.drawImage(image, 400 - 32, 230 - 32, 64, 64)
        }
        setTimeout(() => { draw()}, 100)
    }

    function draw() {
        if (!slimeImage) {
            return
        }

        const canvas = canvasRef?.current
        const ctx = canvas?.getContext('2d')!
        ctx.strokeStyle = 'white'
        ctx.fillStyle = 'white'
        ctx.lineWidth = 5
        ctx.font = '24px sans-serif'
        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)

        if (globalState.gamePhase === GamePhase.Cleared) {
            ctx.font = '50px sans-serif'
            ctx.fillText('ゲームクリア', 250, 250)
            ctx.fillText('へいわがおとずれた', 170, 350)
        } else {
            ctx.drawImage(slimeImage, 400 - 32, 230 - 32, 64, 64)
            if (globalState.playerState === PlayerState.ReadMessage) {
                ctx.strokeRect(180, 400, 440, 180)
                drawMessage(ctx, globalState.message!)
            } else if (globalState.playerState === PlayerState.SelectAction) {
                drawActions(ctx, globalState.selectedAction)
            }
            drawPlayerHealth(ctx, globalState.playerHealth, globalState.playerInitialHealth)
        }
    }

    function listenKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            dispatchEvent({type: 'changeAction'})
        }
        if (e.key === 'Enter') {
            dispatchEvent({type: 'confirm'})
        }
    }

    function onRect(x: number, y: number, rect: { x: number, y: number, width: number, height: number }) {
        return rect.x < x && x < rect.x + rect.width &&
            rect.y < y && y < rect.y + rect.height
    }

    function handleClick(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        console.log(x, y)

        if (onRect(x, y, {x: 180, y: 400, width: 150, height: 180})) {
            dispatchEvent({type: 'changeAction'})
        } else {
            dispatchEvent({type: 'confirm'})
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', listenKeyDown)
        draw()
        const image = new Image()
        image.src = '/slime2.png'
        image.onload = () => {
            setSlimeImage(image)
        }

        return () => {
            document.removeEventListener('keydown', listenKeyDown)
        }
    }, [])

    useEffect(() => {
        draw();
    }, [globalState, slimeImage])

    return (
        <main className={"h-screen w-screen flex justify-center items-center bg-emerald-50"}>
            <canvas className={"bg-black w-full max-w-[800px]"} ref={canvasRef} id="canvas" width={view.width}
                    height={view.height} onClick={handleClick}>
            </canvas>
        </main>
    )
}
