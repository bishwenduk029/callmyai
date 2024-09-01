window.CallMyAIWindow = zoid.create({
  tag: "callmyai-iframe",
  url: "http://localhost:3000/embed/bishwenduk029",
  dimensions: {
    width: "400px",
    height: "600px",
  },
  containerTemplate: ({ context, focus, close, doc }) => {
    function closeComponent(event) {
      event.preventDefault()
      event.stopPropagation()
      return close()
    }

    function focusComponent(event) {
      event.preventDefault()
      event.stopPropagation()
      return focus()
    }

    const container = document.createElement('div')
    container.className = 'callmyai-container'
    container.onclick = focusComponent

    const closeButton = document.createElement('a')
    closeButton.href = '#'
    closeButton.className = 'callmyai-close'
    closeButton.onclick = closeComponent

    const style = document.createElement('style')
    style.textContent = `
      .callmyai-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 400px;
        height: 600px;
        border: 2px solid black;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        background-color: white;
        overflow: hidden;
      }

      .callmyai-container iframe {
        width: 100%;
        height: 100%;
        border: none;
      }

      .callmyai-close {
        position: absolute;
        right: 10px;
        top: 10px;
        width: 20px;
        height: 20px;
        opacity: 0.6;
        cursor: pointer;
      }

      .callmyai-close:hover {
        opacity: 1;
      }

      .callmyai-close:before,
      .callmyai-close:after {
        position: absolute;
        left: 9px;
        content: ' ';
        height: 20px;
        width: 2px;
        background-color: black;
      }

      .callmyai-close:before {
        transform: rotate(45deg);
      }

      .callmyai-close:after {
        transform: rotate(-45deg);
      }
    `

    container.appendChild(closeButton)
    document.head.appendChild(style)

    return container
  },
})
