export type ShippingOption = {
  id: string;
  name: string;
  cost: number;
};

export function calculateShipping(zipCode: string, totalCart: number): ShippingOption[] {
  // Eliminamos espacios y aseguramos que sea string
  const cp = zipCode.trim();

  // Si el CP es 8307 (Catriel)
  if (cp === '8307') {
    return [
      { id: 'local_pickup', name: 'Retiro en local (Catriel)', cost: 0 },
      { id: 'home_delivery_catriel', name: 'Envío a domicilio (Catriel)', cost: 3000 }
    ];
  }

  // Si el CP es 8201 (25 de Mayo)
  if (cp === '8201') {
    return [
      { id: 'delivery_25_mayo', name: 'Envío a 25 de Mayo', cost: 10000 }
    ];
  }

  // Si el CP es 8300 (Neuquén Capital)
  if (cp === '8300') {
    return [
      { id: 'delivery_neuquen_cap', name: 'Envío a Neuquén Capital', cost: 15000 }
    ];
  }

  // Resto de Rio Negro o Neuquén (rango 8301 - 8500, excluyendo 8300 y 8307 que ya fueron evaluados)
  const cpNumber = parseInt(cp, 10);
  if (!isNaN(cpNumber) && cpNumber > 8300 && cpNumber <= 8500) {
    return [
      { id: 'regional_delivery', name: 'Envío a Río Negro / Neuquén', cost: 15000 }
    ];
  }

  // Resto del país
  return [
    { id: 'national_delivery', name: 'Envío a resto del país', cost: 20000 }
  ];
}
