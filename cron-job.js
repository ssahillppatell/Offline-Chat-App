const path = require('path');
const fs = require('fs');
const fse = require('fs-extra')

const directory = path.join(__dirname, "public", "data");

fse.emptyDir(directory, (err) => {
    if(err) {
        throw err;
    } else {
        console.log(`Folder Emptied @ ${new Date().toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })}`);
    }
})