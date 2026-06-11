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
    toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    toggleBtn.style.width = '64px';
    toggleBtn.style.height = '64px';
    toggleBtn.style.borderRadius = '32px';
    toggleBtn.style.backgroundColor = '#0f172a'; // slate-900
    toggleBtn.style.color = 'white';
    toggleBtn.style.border = 'none';
    toggleBtn.style.cursor = 'pointer';
    toggleBtn.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.4)';
    toggleBtn.style.display = 'flex';
    toggleBtn.style.alignItems = 'center';
    toggleBtn.style.justifyContent = 'center';
    toggleBtn.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background-color 0.2s ease';

    toggleBtn.addEventListener('mouseenter', () => {
        toggleBtn.style.transform = isOpen ? 'rotate(90deg) scale(1.05)' : 'scale(1.05)';
        toggleBtn.style.backgroundColor = '#1e293b'; // slate-800
    });
    toggleBtn.addEventListener('mouseleave', () => {
        toggleBtn.style.transform = isOpen ? 'rotate(90deg) scale(1)' : 'scale(1)';
        toggleBtn.style.backgroundColor = '#0f172a';
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
            toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
            toggleBtn.style.transform = 'rotate(90deg)';
        } else {
            iframeContainer.style.opacity = '0';
            iframeContainer.style.transform = 'translateY(10px)';
            setTimeout(() => {
                iframeContainer.style.display = 'none';
            }, 300);
            toggleBtn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
            toggleBtn.style.transform = 'rotate(0deg)';
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
