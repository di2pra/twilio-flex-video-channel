export type IParsedToken = {
  exp: number;
  grants: {
    identity: string;
    chat: {
      service_sid: string;
    }
    video: {
      room: string;
    }
  }
}

export type IPartner = {
  id: string;
  name: string;
  numero: string;
}

export type IVideoTask = {
  sid: string;
  assignmentStatus: string;
  workerName: string;
}