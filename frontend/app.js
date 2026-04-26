let globalBooks = [];

const updateCartUI = () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const countEl = document.getElementById('cart-count');
    if (countEl) countEl.innerText = cart.length;
};

const handleAddToCart = (bookId) => {
    const book = globalBooks.find(b => b.id === bookId);
    if (!book) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (!cart.some(item => item.id === book.id)) {
        cart.push(book);
        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${book.title} added to cart!`);
        updateCartUI();
    } else {
        alert("This book is already in your cart.");
    }
};

const removeFromCart = (bookId) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== bookId);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    if (typeof loadCart === 'function') loadCart();
    updateCartUI();
};

// Advanced Fallback: Tries local file first (fast/reliable), falls back to remote if missing
const handleDownload = async (bookId, remoteUrl) => {
    const localUrl = `assets/downloads/${bookId}.epub`;
    
    if (!navigator.onLine) {
        window.open(localUrl, '_blank');
        return;
    }

    try {
        // Fast HEAD request to check if the file exists on the local server
        const response = await fetch(localUrl, { method: 'HEAD' });
        if (response.ok) {
            window.open(localUrl, '_blank'); // Local file exists, use it instantly
        } else {
            window.open(remoteUrl, '_blank'); // Local missing, fallback to remote
        }
    } catch (err) {
        // Fetch failed, fallback to remote
        window.open(remoteUrl, '_blank');
    }
};

const handlePreview = (previewUrl) => {
    if (navigator.onLine) {
        window.open(previewUrl, '_blank');
    } else {
        alert("Preview is not available offline. Please connect to the internet.");
    }
};

// Advanced Bulk Download with Fallback
const downloadAll = async () => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) return;

    let downloadCount = 0;

    for (let i = 0; i < cart.length; i++) {
        const item = cart[i];
        if (item.downloadUrl) {
            downloadCount++;
            const localUrl = `assets/downloads/${item.id}.epub`;
            
            try {
                // Check local file existence before queuing the download
                const response = navigator.onLine ? await fetch(localUrl, { method: 'HEAD' }) : { ok: true };
                const finalUrl = response.ok ? localUrl : item.downloadUrl;
                
                setTimeout(() => {
                    window.open(finalUrl, '_blank');
                }, i * 600); // 600ms stagger prevents browser popup blockers
            } catch (e) {
                setTimeout(() => {
                    window.open(item.downloadUrl, '_blank');
                }, i * 600);
            }
        }
    }

    if (downloadCount > 0) {
        alert(`Successfully initiated ${downloadCount} downloads.\nYour cart will now be cleared.`);
        localStorage.removeItem('cart');
        if (typeof loadCart === 'function') loadCart();
        updateCartUI();
    } else {
        alert("No downloadable files available for the selected books.");
    }
};

document.addEventListener('DOMContentLoaded', updateCartUI);