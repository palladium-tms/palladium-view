export class Result {
  id: number;
  status_id: string;
  created_at: number;
  subdescriber = [];
  describer;

  constructor(data) {
    this.id = data.id;
    this.describer = [{'title': 'message', 'value': data.message}];
    if (this.isJson(data.message) && JSON.parse(data.message)) {
      const message = JSON.parse(data.message);
      if (message.subdescriber && message.describer) {
        if (message.subdescriber instanceof Array) {
          this.subdescriber = message.subdescriber;
        }
        if (message.describer instanceof Array) {
          this.describer = message.describer;
        }
      }
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
