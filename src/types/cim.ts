export type Cim = {
  id: string;
  name: string;
  comarcas: Array<Comarca>;
  altitude: number;
  longitude: number;
  latitude: number;
  url: string;
  img?: string;
  essencial: boolean;
  climbed?: boolean;
};

export type Comarca = {
  id: string;
  name: string;
};
