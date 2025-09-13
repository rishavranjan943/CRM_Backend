export function personalizeMessage(template, customer) {
    let msg = template;
    msg = msg.replace(/{{\s*name\s*}}/gi, customer.name || "");
    msg = msg.replace(/{{\s*total_spend\s*}}/gi, customer.total_spend?.toString() || "0");
    return msg;
  }
  