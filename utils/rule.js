export function buildMongoQuery(rules) {
    if (!rules) return {};
  
    if (rules.op === "AND") {
      return { $and: rules.children.map(buildMongoQuery) };
    }
    if (rules.op === "OR") {
      return { $or: rules.children.map(buildMongoQuery) };
    }
  
    const field = rules.field;
    const cmp = rules.cmp;
    const value = rules.value;
  
    switch (cmp) {
      case ">": return { [field]: { $gt: value } };
      case "<": return { [field]: { $lt: value } };
      case "=": return { [field]: value };
      case "!=": return { [field]: { $ne: value } };
      default: return {};
    }
  }
  