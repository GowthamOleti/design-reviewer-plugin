async function getDesignMetadata(node: SceneNode): Promise<string> {
  let details = `Node Name: ${node.name}\nType: ${node.type}`;
  if ("fills" in node && node.fills) {
    const fill = node.fills[0] as Paint;
    if (fill && fill.type === "SOLID") {
      const { r, g, b } = fill.color;
      details += `\nColor: rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;
    }
  }
  if ("characters" in node) {
    details += `\nText: ${(node as TextNode).characters}`;
  }
  return details;
}

figma.ui.onmessage = async (msg) => {
  if (msg.type === "review-design") {
    const selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.ui.postMessage({ type: "review-result", result: "No frame selected." });
      return;
    }

    const node = selection[0];
    const metadata = await getDesignMetadata(node);

    // Replace this with your GPT API call
    const gptResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [{
          role: "user",
          content: `You're a UI/UX design expert. Analyze the following design and provide 3 actionable improvements:\n${metadata}`
        }],
        temperature: 0.7
      })
    });

    const json = await gptResponse.json();
    const suggestions = json.choices?.[0]?.message?.content || "No suggestions received.";

    figma.ui.postMessage({ type: "review-result", result: suggestions });
  }
};

figma.showUI(__html__, { width: 320, height: 380 });
