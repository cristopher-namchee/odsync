interface ActionUserPayload {
  id: string;
  username: string;
  name: string;
}

export interface MultiSelectActionPayload {
  type: 'block_actions';
  user: ActionUserPayload;
  trigger_id: string;
  channel: {
    id: string;
    name: string;
  };
  actions: [
    {
      action_id: string;
      block_id: string;
      type: 'multi_static_select';
      selected_options: {
        value: string;
      }[];
    },
  ];
}
