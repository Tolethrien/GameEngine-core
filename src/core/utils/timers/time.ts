export default class Time {
  lastTimeStamp: number;
  currenttimestamp: number;
  now: number;
  timestamps: number[];
  constructor() {
    this.lastTimeStamp = 0;
    this.currenttimestamp = 0;
    this.now = 0;
    this.timestamps = [];
  }
  calculateTimeStamp() {
    this.now = performance.now();
    this.currenttimestamp = this.now - this.lastTimeStamp;
    if (this.timestamps.length === 60) this.timestamps.shift();
    this.timestamps.push(this.currenttimestamp);
    this.lastTimeStamp = this.now;
  }
  get getMilliSeconds() {
    return this.currenttimestamp;
  }
  get getSeconds() {
    return this.currenttimestamp / 1000;
  }
}
