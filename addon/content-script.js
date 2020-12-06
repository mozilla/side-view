function getLinkNode(e) {
    let target = e.target;
    while ((target.tagName !== "A" || !target.href) && target.parentNode) {
        target = target.parentNode;
    }
    return target;
}

function openUrl(e) {
    let target = getLinkNode(e);
    if (target.tagName !== "A" || !e.altKey) return;

    browser.runtime.sendMessage({type: "openUrl", url: target.href});
}

window.addEventListener("click", openUrl);
