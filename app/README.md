
## Quick-start

### Step 1) Requirements

- Windows / Linux / macOS 10 (or Docker)
- [Node.js](https://nodejs.org/) (version 8.3.0 or higher) and [MongoDB](https://www.mongodb.com/).

### Step 2) Install 

Run in your console,

```
git clone https://github.com/mnkprs/SimBot.git
```

Create your configuration file by copying `conf-binance.js` to `conf.js`:

```
cp conf-binance.js conf.js
```

- View and edit `conf.js`.
- (optional) You must add your exchange API keys to enable real trading however.
- API keys do NOT need deposit/withdrawal permissions.

If using Docker, skip to section "Docker" below.

Install dependencies:

```
cd SimBot/app
npm install
```

### Ubuntu 16.04 Step-By-Step

```
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install build-essential mongodb -y

curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs

git clone https://github.com/mnkprs/SimBot.git
cd SimBot/app
npm install

```
### GUI Usage

- Navivate to ```localhost:3000```
- Go  to backfill
- Select a selector to perform a simulation (backfilling 14 days old trade data to mongoDB takes ~2 minutes. Http Request may timeout but backfilling will still go on until its completed. Check cmd for more details while request is pending.)
- Then go to home page and select the selector you previously backfilled and optionally adjust parameters.
- Run sim.
- Profit??
### TODOs
- [ ] Fix simulation template results view
- [ ] Handle Backfill request view page
- [ ] Docker
- [ ] More strategies