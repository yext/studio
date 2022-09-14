import { ComponentState } from '../../shared/models';

export default function getChildComponentStates(uuid: string, componentsOnPage: ComponentState[]) {
  return componentsOnPage.filter(c => c.parentUUID === uuid)
}