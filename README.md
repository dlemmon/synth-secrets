# Synth Secrets

We are currently reading the fantastic [Synth Secrets](http://www.soundonsound.com/sos/allsynthsecrets.htm) series from **Sound On Sound** magazine, written by Gordon Reid.

And we find it a little hard to digest online, so we are compiling it into EPUB format.

Obviously none of this content is ours, and if I’m asked to take it down I will. 

This is a work started by grillpanda and I make my own way to automatize it. I created a nodejs script to download the SOS links with the asociated images based on a csv file.

## Progress

All of the 63 are in the repo

## Re-Scraping the articles 

This is usually not needed, as the articles do not change. However if you want to rescrape the articles you need node js installed.

With node js installed you can do a `npm install` to download the needed submodules. Then you can do:
    
    node scrap-sos-page.js sos-links/24-63.csv

That way you get the chapters 24 to 63 whose links are in the CSV

## Generating the EPUB

If you want to regenerate the EPUB from this repository for whatever reason:

    git clone https://github.com/grillpanda/synth-secrets.git
    cd epub
    ./rebuild.sh

You’ll need to have **epubcheck** installed to run `rebuild.sh`. You can install it on a Mac with Homebrew.

    brew install epubcheck
    
## Thanks 

Thanks to Gordon Reid for give us this fantastic set of whisdom.

Thanks also for Grill Panda and his ideas, that I took to start my work and finish this recopilation.



