(function() {
    if (document.getElementById('rag-chatbot-widget-container')) return;

    // Determine the base URL of this script to point the iframe correctly
    const currentScript = document.currentScript || (function() {
        const scripts = document.getElementsByTagName('script');
        return scripts[scripts.length - 1];
    })();
    const scriptSrc = currentScript.src;
    const widgetBaseUrl = new URL(scriptSrc).origin;
    
    // Configurable base URL via data attribute, no longer accepts sensitive api-url
    // const apiUrl = currentScript.getAttribute('data-api-url') || 'http://localhost:8000'; // Removed for security

    const container = document.createElement('div');
    container.id = 'rag-chatbot-widget-container';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '999999';
    container.style.display = 'flex';
    container.style.flexDirection = 'column';
    container.style.alignItems = 'flex-end';
    container.style.fontFamily = 'system-ui, -apple-system, sans-serif';

    // The iframe container (hidden by default)
    const iframeContainer = document.createElement('div');
    iframeContainer.style.width = '380px';
    iframeContainer.style.height = '600px';
    iframeContainer.style.maxHeight = '80vh';
    iframeContainer.style.maxWidth = '90vw';
    iframeContainer.style.backgroundColor = '#fff';
    iframeContainer.style.borderRadius = '16px';
    iframeContainer.style.boxShadow = '0 10px 40px rgba(0,0,0,0.15)';
    iframeContainer.style.overflow = 'hidden';
    iframeContainer.style.display = 'none';
    iframeContainer.style.marginBottom = '16px';
    iframeContainer.style.transition = 'all 0.3s ease';
    iframeContainer.style.opacity = '0';
    iframeContainer.style.transform = 'translateY(10px)';

    const iframe = document.createElement('iframe');
    iframe.src = `${widgetBaseUrl}/widget-iframe`;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframeContainer.appendChild(iframe);

    // The toggle button
    const toggleBtn = document.createElement('button');
    const closedIconHTML = `<img src="${widgetBaseUrl}/chatbot_logo.png" alt="Chat" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;" />`;
    toggleBtn.innerHTML = closedIconHTML;
    toggleBtn.style.width = '64px';
    toggleBtn.style.height = '64px';
    toggleBtn.style.borderRadius = '32px';
    toggleBtn.style.backgroundColor = '#ea580c'; // orange-600
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = 'none';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.boxShadow = '0 4px 12px rgba(234, 88, 12, 0.4)';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    toggleBtn.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease';

    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.transform = 'scale(1.05)';
        toggleBtn.style.backgroundColor = '#c2410c'; // orange-700
    });
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.transform = 'scale(1)';
        toggleBtn.style.backgroundColor = '#ea580c';
    });

    let isOpen = false;
    toggleBtn.addEventListener('click', () => {
        isOpen = !isOpen;
        if (isOpen) {
            iframeContainer.style.display = 'block';
            setTimeout(() => {
                iframeContainer.style.opacity = '1';
                iframeContainer.style.transform = 'translateY(0)';
            }, 10);
        } else {
            iframeContainer.style.opacity = '0';
            iframeContainer.style.transform = 'translateY(10px)';
            setTimeout(() => {
                iframeContainer.style.display = 'none';
            }, 300);
        }
    });

    container.appendChild(iframeContainer);
    container.appendChild(toggleBtn);
    document.body.appendChild(container);

    // Listen for messages from the iframe
    window.addEventListener('message', (event) => {
        if (event.data === 'MINIMIZE_CHAT' && isOpen) {
            toggleBtn.click(); // Trigger native collapse
        }
    });
})();
