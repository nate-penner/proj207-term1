I added a binary called travelexperts.

After the commit where I added this, if you run 'npm install', it will try to install a binary. After it's done,
you should be able to just type 'travelexperts' in the command prompt to run the server, or 'travelexperts.cmd' in the
WebStorm terminal.

You can also specify a port:

> travelexperts --http-port 56789
> travelexperts.cmd --http-port 12345

Let me know if it worked or not. I don't know if it will work on Mac. On Linux you'd have to run 'sudo npm install' for
it to work.

- Nate