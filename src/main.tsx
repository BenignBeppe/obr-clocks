import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import OBR from "@owlbear-rodeo/sdk";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)

const ID = "eu.sebber.obr-clock";

function createTool() {
    OBR.tool.create({
        id: `${ID}/tool`,
        icons: [
            {
                icon: "/tool.svg",
                label: "Clocks",
            }
        ]
    });
}

function createSizeMode(size: number, label: string) {
    OBR.tool.createMode({
        id: `${ID}/mode-${size}`,
        icons: [
            {
                icon: `/mode-${size}.svg`,
                label: label,
                filter: {
                    activeTools: [`${ID}/tool`],
                },
            },
        ],
    });
}

OBR.onReady(() => {
    createTool();
    createSizeMode(4, "Four");
    createSizeMode(6, "Six");
    createSizeMode(8, "Eight");
});
