/**
 * The single data contract between the glove and the app.
 *
 * Only `type` and `text` are required. All other fields are optional and may be
 * added by future firmware (including a trained recognition model) WITHOUT
 * requiring any change to the app. Never tightly couple UI to this exact shape.
 */
export const GESTURE_MESSAGE_TYPE = 'gesture';

export interface GestureMessage {
  type: typeof GESTURE_MESSAGE_TYPE;
  text: string;
  /** 0..1 recognition confidence, if the glove provides it. */
  confidence?: number;
  /** Epoch milliseconds, if the glove provides it. */
  timestamp?: number;
  /** Stable machine id for the gesture (e.g. "hello"), if provided. */
  gestureId?: string;
  /** BCP-47 language tag of the text (e.g. "en"), if provided. */
  language?: string;
}
