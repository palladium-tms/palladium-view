export class Invite {
  created_at;
  expiration_data;
  token;
  constructor (current_invite) {
    console.log(current_invite);
    this.created_at = current_invite['created_at'];
    this.expiration_data = current_invite['expiration_data'];
    this.token = current_invite['token'];
  }
}