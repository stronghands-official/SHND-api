# StrongHands Official API Development Repository

## Repo Info
-

## What is StrongHands?

StrongHands API is a StrongHands network-compatible, community-developed API.

The project has been designed to provide people with a stable, secure, and feature-rich api.

To help faciliate broad community cooperation, a number of trusted StrongHands/Peershares community leaders have write permissions to the project's codebase, allowing for decentralization and continuity. Community members, old and new, are encouraged to find ways to contribute to the success of the project. If you have experience with programming, product design, QA engineering, translation, or have a different set of skills that you want to bring to the project, your involvement is appreciated!


### StrongHands Resources
-


### About StrongHands
[StrongHands](http://stronghands.net/) (abbreviated SHND), also known as StrongHands is using [proof-of-stake consensus](http://stronghands.net/bin/stronghands-paper.pdf) as a security model, with a combined [proof-of-stake](http://stronghands.net/bin/stronghands-paper.pdf)/[proof-of-work](https://en.wikipedia.org/wiki/Proof-of-work_system) minting system. StrongHands is based on [Bitcoin](http://bitcoin.org/en/), while introducing many important innovations to cryptocurrency field including new security model, energy efficiency, better minting model and more adaptive response to rapid change in network computation power.


## Repo Guidelines

* Developers work in their own forks, then submit pull requests when they think their feature or bug fix is ready.
* If it is a simple/trivial/non-controversial change, then one of the development team members simply pulls it.
* If it is a more complicated or potentially controversial change, then the change may be discussed in the pull request.
* The patch will be accepted if there is broad consensus that it is a good thing. Developers should expect to rework and resubmit patches if they don't match the project's coding conventions or are controversial.
* From time to time a pull request will become outdated. If this occurs, and the pull is no longer automatically mergeable; a comment on the pull will be used to issue a warning of closure.  Pull requests closed in this manner will have their corresponding issue labeled 'stagnant'.
* For development ideas and help see [here](http://www.stronghandstalk.org/index.php?board=10.0).



## Run the API on Linux (Ubuntu 14.04 / 16.04 in this case) 

The Node.js version used is 8.6.0, the following is executed in /home/${USER}.

    curl -sL https://deb.nodesource.com/setup_8.6 | sudo -E bash -
    sudo apt-get install -y nodejs
    git clone https://github.com/JonasDev99/stronghands-api.git
    cd stronghands-api
    npm install
    cp example.config.js config.js
Configure 'config.js' with your prefered editor

To run the api:
    
    node bin/www
    
To run the api and automatically restart it when something has changed:    
    
    nodemon

Optional: install build tools
To compile and install native addons from npm you may also need to install build tools:

    sudo apt-get install -y build-essential

