(function(root, undefined) {
    root.addEventListener('load', () => {
        root.addEventListener('resize', () => {
            root.document.querySelector('title').innerHTML = `${window.innerWidth}x${window.innerHeight}`;
        });
    });

})(window);