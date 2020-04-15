export class Invite {
  created_at;
  expiration_data;
  token;
  link;
  constructor (currentData) {
    if (currentData !== {}) {
      this.created_at = currentData['created_at'];
      this.expiration_data = currentData['expiration_data'];
      this.token = currentData['token'];
      this.link = location.host + '/registration?invite=' + this.token;
    }
  }
}
