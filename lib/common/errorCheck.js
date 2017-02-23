'use babel';

module.exports = {
  showError: (value) => {
    if (value.hasOwnProperty('code') && value.hasOwnProperty('message') && Array.isArray(value.message)) {
      console.log(`Rejected:\ncode:${value.code}\nmessage:${value.message.join('\n')}`);
    } else {
      console.log('Rejected:');
      console.log(value.message);
    }
  }
};
