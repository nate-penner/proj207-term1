(function(root, undefined) {
    root.addEventListener('load', main);

    function main() {
        const header = document.querySelector('body > header');
        const nav = document.querySelector('body > nav');

        let isMenuOpen = false;

        header.addEventListener('click', () => {
            if (!isMenuOpen) {
                header.style.transform = 'rotate(-90deg)';
                document.querySelector('body > header h1').innerHTML = '<';
                nav.style.visibility = 'visible';
                isMenuOpen = true;
            } else {
                nav.style.visibility = 'hidden';
                header.style.transform = 'none';
                document.querySelector('body > header h1').innerHTML = '>';
                isMenuOpen = false;
            }
        });
    }
})(window);