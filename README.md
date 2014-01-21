hashcrack
=========

Run a hashcrack server with `node server.js 1234 password`.  This will start hashcrack running at `localhost:1234`.

Now, in a browser, navigate to `http://localhost:1234/`.  This browser window will now become a hash cracking slave.  To control your minions, go to `http://localhost:1234/admin`, enter the password (in this case, `password`), type a hash and click run.  When a slave cracks the hash, it'll popup in an `alert()`.
