export class Result {
  id: number;
  status_id: string;
  created_at: number;
  subdescriber = [];
  describer;

  constructor(data) {
    this.id = data.id;
    if (this.isJson(data.message)) {
      const message = JSON.parse(data.message);
      if (message.subdescriber && message.describer) {
        if (message.subdescriber instanceof Array) {
          this.describer = message.describer;
          this.subdescriber = message.subdescriber;
        } else {
          this.describer = data.message;
        }
      } else {
        this.describer = JSON.parse(data.message);
      }
    } else {
      this.describer = data.message;
    }
    this.status_id = data['status_id'];
    this.created_at = data['created_at'];
  }

  isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
