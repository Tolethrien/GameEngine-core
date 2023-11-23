export default abstract class Component {
  entityID: ComponentProps["entityID"];
  entityTags: ComponentProps["entityTags"];
  constructor({ entityID, entityTags }: ComponentProps) {
    this.entityID = entityID;
    this.entityTags = entityTags;
  }
}
