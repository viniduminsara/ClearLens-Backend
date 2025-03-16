import { SensitiveKeys } from '../enum/sensitive-keys.enum';
import { SpecialMessages } from '../../../shared/enums/messages/special-messages.enum';

const sensitiveKeysList = Object.values(SensitiveKeys) as string[];
const seenObjects = new WeakSet(); // Track seen objects

const redactLogData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  // Avoid infinite recursion for circular references
  if (seenObjects.has(data)) return '[CIRCULAR]';
  seenObjects.add(data);

  // Avoid processing Mongoose models
  if (data.constructor && data.constructor.name.startsWith('model')) {
    return '[MONGOOSE MODEL]';
  }

  if (Array.isArray(data)) {
    return data.map(item => redactLogData(item));
  }

  const redactedData: any = {};

  for (const key in data) {
    redactedData[key] = sensitiveKeysList.includes(key)
        ? SpecialMessages.Redacted
        : redactLogData(data[key]); // Recursive call
  }

  return redactedData;
};

export default redactLogData;
