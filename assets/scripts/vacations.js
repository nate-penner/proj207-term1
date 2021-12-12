/*
* Script to handle expansion/collapse of images on the vacation packages page
* Author: Nate Penner
* When: December 2021
* */
(function (window, undefined) {
    console.log('Loaded vacations.js');
    const document = window.document;

    window.addEventListener('load', main);

    // Run after window is loaded and DOM is available
    function main() {
        // Set up the click listeners for the various packages
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

    // toggle the visibility of the photos for packageId. The 'visible' parameter is a boolean that is toggled and then
    // returned
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