import React, { useEffect, useRef } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

interface Props {
  value: string;
  onChange: (val: string) => void;
  onAddressSelect?: (address: string, lat?: number, lng?: number) => void;
  className?: string;
  placeholder?: string;
}

export function AddressAutocomplete({ value, onChange, onAddressSelect, className, placeholder = "Dirección de entrega..." }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const placesLib = useMapsLibrary('places');
  const [autocomplete, setAutocomplete] = React.useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !inputRef.current) return;

    // Use traditional Autocomplete widget restriction to Spain
    const options = {
      componentRestrictions: { country: 'es' },
      fields: ['formatted_address', 'geometry', 'name'],
    };

    const autocompleteInstance = new placesLib.Autocomplete(inputRef.current, options);
    setAutocomplete(autocompleteInstance);

    autocompleteInstance.addListener('place_changed', () => {
      const place = autocompleteInstance.getPlace();
      if (place && place.formatted_address) {
        onChange(place.formatted_address);
        if (onAddressSelect) {
           onAddressSelect(
              place.formatted_address, 
              place.geometry?.location?.lat(), 
              place.geometry?.location?.lng()
           );
        }
      }
    });
  }, [placesLib]);

  return (
    <input
      ref={inputRef}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      autoComplete="off"
    />
  );
}
