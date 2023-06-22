import { useMutation, useQuery, useQueryClient } from 'react-query';

import { supabase } from '../supabase';
import { Place } from '../types';

export function useFetchPlaces() {
  return useQuery<Array<Place>>('places', async (): Promise<Array<Place>> => {
    const { data, error } = await supabase.rpc('get_places')
    if (error) {
      throw new Error(error.message);
    }
    return data;
  });
}

export function useCreatePlace() {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, Place>(
    async (placeData) => {
      console.log(placeData)
      const { error } = await supabase.from('places').insert(placeData)
      console.log(error)
      if (error) {
        throw new Error(error.message);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("places");
      },
    }
  );
}