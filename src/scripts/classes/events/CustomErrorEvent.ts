import { EventType } from "../../enums/EventType";

export class CustomErrorEvent extends Event {
  error: Error;

  constructor(error: Error) {
    super(EventType.CUSTOM_ERROR_EVENT);
    this.error = error;
  }
}
