'use client';

import React, {useEffect, useRef, useState} from "react";
import NextImage from "next/image";
enum Action {
    Fight,
    Escape,
}
enum ControlState {
    selectAction,
    readMessage,
}

enum GameState {
    fighting,
    destroyed,
    cleared
}

export default function Home() {
    const view = { height: 600, width: 800 };
    const [x, setX] = useState(100);
    const [y, setY] = useState(100);
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [image, setImage] = useState<HTMLImageElement | null>(null)
    const [selectedAction, setSelectedAction] = useState(Action.Fight)
    const [message, setMessage] = useState<string | null>(null)
    const [e, setE] = useState<KeyboardEvent | null>(null)
    const [controlState, setControlState] = useState(ControlState.selectAction)
    const [enemyHealth, setEnemyHealth] = useState(5000)
    const [gameState, setGamestate] = useState(GameState.fighting)

    function listenKeyDown(e: KeyboardEvent) {
        setE(e)
    }
    function act() {
        if (controlState === ControlState.selectAction) {
            if (selectedAction === Action.Fight) {
                const damage = 800 + Math.floor(Math.random() * 100)
                setMessage(`スライムに${damage}のダメージ`)
                setEnemyHealth((enemyHealth) => enemyHealth - damage)
                if (enemyHealth <= 0) {
                    setGamestate(GameState.destroyed)
                }
                setControlState(ControlState.readMessage)
            } else {
                setMessage('しかしにげることはできない')
                setControlState(ControlState.readMessage)
            }
        } else if (controlState === ControlState.readMessage) {
            if (message) { setMessage(null) }
            if (gameState === GameState.destroyed) {
                setMessage('スライムをたおした！')
                setControlState(ControlState.readMessage)
                setGamestate(GameState.cleared)
            } else if (gameState === GameState.cleared) {
                // do nothing
            } else {
                setControlState(ControlState.selectAction)
            }
        }
    }

    useEffect(() => {
        if (!e) { return }

        if (e.key === 'ArrowRight') {
            setX((x) => x + 10);
        }
        if (e.key === 'ArrowLeft') {
            setX((x) => x - 10);
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            setSelectedAction((selectedAction) => {
                if (selectedAction === Action.Fight) {
                    return Action.Escape
                } else {
                    return Action.Fight
                }
            })
        }
        if (e.key === 'Enter') {
            act();
        }
    }, [e]);

    function drawActions(ctx: CanvasRenderingContext2D, selectedAction: Action) {
        console.log('drawActions', selectedAction)
        ctx.strokeRect(180, 400, 150, 180)
        if (selectedAction === Action.Fight) {
            ctx.fillText('▶', 185, 450)
        }
        ctx.fillText('たたかう', 210, 450)
        if (selectedAction === Action.Escape) {
            ctx.fillText('▶', 185, 500)
        }
        ctx.fillText('にげる', 210, 500)
    }
    function draw() {
        if (!image) { return }

        const canvas = canvasRef?.current
        const ctx = canvas?.getContext('2d')!
        ctx.strokeStyle = 'white'
        ctx.fillStyle = 'white'
        ctx.lineWidth = 5
        ctx.font = '24px sans-serif'

        ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height)
        if (gameState === GameState.cleared && controlState === ControlState.readMessage && !message) {
            ctx.font = '50px sans-serif'
            ctx.fillText('ゲームクリア', 250, 250)
            ctx.fillText('へいわがおとずれた', 170, 350)
        } else {
            ctx.drawImage(image, 400 - 32, 230 - 32, 64, 64)
            if (message) {
                ctx.strokeRect(180, 400, 440, 180)
                ctx.fillText(message, 200, 440)
            } else {
                drawActions(ctx, selectedAction)
            }
        }
    }

    useEffect(() => {
        document.addEventListener('keydown', listenKeyDown)
        draw()
        const image = new Image()
        image.src = '/slime.png'
        image.onload = () => { setImage(image) }

        return () => {
            document.removeEventListener('keydown', listenKeyDown)
        }
    }, [])

    useEffect(() => {
        draw();
    }, [x, y, image, selectedAction, message]);

  return (
    <main>
      <canvas className={"bg-black"} ref={canvasRef} id="canvas" width={view.width} height={view.height}>
      </canvas>
    </main>
  )
}
