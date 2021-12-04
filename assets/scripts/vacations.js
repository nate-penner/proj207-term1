(function (window, undefined) {
    console.log('Loaded vacations.js');
    const document = window.document;

    window.addEventListener('load', main);

    function main() {
        document
            .querySelectorAll('.vacation-package')
            .forEach((vacation) => {
                console.log(vacation);
                const packageId = vacation.getAttribute('id').replace('package-', '');
                let visible = false;

                vacation.addEventListener('click', (e) => {
                    visible = toggle(packageId, visible);
                });
            });
    }

    function toggle(packageId, visible) {
        if (!visible) {
            document.querySelector(`#package-images-${packageId}`).style.display = 'block';
            visible = true;
        } else {
            document.querySelector(`#package-images-${packageId}`).style.display = 'none';
            visible = false;
        }
        return visible;
    }
})(window);