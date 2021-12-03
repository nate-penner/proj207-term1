!!!IMPORTANT type 'npm install' to make sure you have all the dependencies installed!

For the sake of consistency, I propose that we avoid using any uppercase letters in directory and file names to
proactively avoid any potential bugs caused by case-sensitivity mismatches.

I also suggest that for improved readability we make sure to indent each html tag that is inside of another, and follow a
standardized format with a skeleton more or less like this:

easy to see the structure:
=========================================================
<html lang="en-US">
    <head>
        <!-- Meta tags -->
        <title>Page Title</title>
        <!-- link tags (stylesheets, fonts, etc.) -->
        <!-- external scripts -->
    </head>
    <body>
        <header>
            ...
        </header>

        <section>
            ...
        </section>

        <footer>
            ...
        </footer>
    </body>
</html>
=========================================================

harder to see the structure:
=========================================================
<html lang="en-US">
<head>
<!-- Meta tags -->
<title>Page Title</title>
<!-- link tags (stylesheets, fonts, etc.) -->
<!-- external scripts -->
</head>
<body>
<header>
    ...
</header>

<section>
    ...
</section>

<footer>
    ...
</footer>
</body>
</html>
=========================================================

As for JavaScript, it is common practice to use these naming conventions:

    let thisIsMyVariableOrObject...

    function thisIsMyFunction()...

    function ThisIsMyClass()

    class ThisIsMyClass...

    const PI = 3.14159
    const HTTP_PORT = 80;
    const HTTPS_PORT = 443;