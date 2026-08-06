import "./css/Options.css";
import * as icons from "lucide-react"
import { useState, useEffect } from "react";
import browser from "webextension-polyfill";


declare global {
    interface Window {
        addToken(token: string): void
    }
}

interface sideBarElement {
    icon: React.ComponentType<any>,
    name: string
}

const elements: sideBarElement[] = [
    {
        icon: icons.LayoutDashboard,
        name: "Allgemein"
    },
    {
        icon: icons.KeyIcon,
        name: "Tokens"
    }
]

function Allgemein() {
    return (
        <>
            <div>
                Not In here
            </div>
        </>
    )
}

async function addToken(token: string) {
    const result = await browser.storage.local.get('tokens');
    const tokens = result.tokens as string[] ?? []
    tokens.push(token)
    await browser.storage.local.set({tokens: tokens});
}

async function getTokenArray() {
    const result = await browser.storage.local.get("tokens");
    const tokens = result.tokens as string[] ?? []
    return tokens
}

async function removeTokenFromArray(token: string) {
    const result = await browser.storage.local.get("tokens")
    const tokens = result.tokens as string[] ?? []
    const new_tokens = tokens.filter(tokensn => tokensn !== token)
    await browser.storage.local.set({tokens: new_tokens})
}


function Tokens() {
    const [tokens, setTokens] = useState<string[]>([]);

    const loadTokens = async () => {
        const data = await getTokenArray();
        console.log(data)
        setTokens(data);
    };

    useEffect(() => {
        window.addToken = addToken

        loadTokens();
    }, []);

const handleCreateTokenClick = async () => {
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    const token = Array.from(bytes).map(b => b.toString(16).padStart(2, "0")).join("");
    await addToken(token); // warten, bis wirklich gespeichert wurde
    loadTokens();
}
    const handleDeleteTokenClick = async (token: string) => {
        await removeTokenFromArray(token);
        loadTokens();
    }

    const handleCopyTokenClick = async (token: string) => {
            navigator.clipboard.writeText(token);
    }

    return (
        <>
            <div className="main-content-tokens">

                <div className="tokens-main-content">
                    <div className="token-list-box">
                        {
                            tokens.map((value) => {
                                return (
                                    <div className="token-list-item" key={value}>
                                        <div className="token-item-text">
                                            <h3>{value}</h3>
                                        </div>
                                        <div className="Button minified" onClick={() => handleCopyTokenClick(value)}>
                                            <icons.ClipboardCopy color="#000000" />
                                        </div>
                                        <div className="Button minified" onClick={() => handleDeleteTokenClick(value)}>
                                            <icons.Trash2 color="#000000" />
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
                <div className="tokens-bottom-bar">
                    <div className="button-box">
                        <div className='Button' onClick={handleCreateTokenClick}>
                            <h5>Create Token</h5>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const mainElements: Map<number, React.ReactNode> = new Map([
    [0, <Allgemein />],
    [1, <Tokens />]
]);

export default function Options() {
    const [selectedElement, setSelectedElement] = useState<number>(1)

    return (
        <>
            <div className="side-bar">
                <div className="side-bar-titel">
                    <h4>Add-on Einstellungen</h4>
                </div>
                <div className="side-bar-breakline" />

                {
                    elements.map((value, idx) => {
                        const Icon = value.icon;
                        return (
                            <div
                                className={`side-bar-element ${idx == selectedElement ? "selected" : ""}`}
                                key={idx}
                                onClick={() => {
                                    setSelectedElement(idx);

                                }}>
                                <Icon />
                                <h3>{value.name}</h3>
                            </div>
                        )
                    })
                }
            </div>

            <div className="main-content">
                {
                    mainElements.get(selectedElement)
                }
            </div>
        </>
    );
}