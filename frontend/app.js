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

const downloadAll = (format) => {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) return;

    let downloadCount = 0;

    cart.forEach((item, index) => {
        const url = format === 'pdf' ? item.pdfUrl : item.downloadUrl;
        if (url) {
            downloadCount++;
            setTimeout(() => {
                window.open(url, '_blank');
            }, index * 600); 
        }
    });

    if (downloadCount > 0) {
        // Updated to show count and clear cart upon completion
        alert(`Successfully initiated ${downloadCount} ${format.toUpperCase()} downloads.\nYour cart will now be cleared.`);
        localStorage.removeItem('cart');
        if (typeof loadCart === 'function') loadCart();
        updateCartUI();
    } else {
        alert(`No ${format.toUpperCase()} files available for the selected books.`);
    }
};

document.addEventListener('DOMContentLoaded', updateCartUI);