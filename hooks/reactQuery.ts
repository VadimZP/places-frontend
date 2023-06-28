import { useMutation, useQuery, useQueryClient } from 'react-query';

import { supabase } from '../supabase';
import { Place, Review } from '../types';

export function useFetchPlaces() {
  return useQuery<Array<Place>>('places', async (): Promise<Array<Place>> => {
    const { data, error } = await supabase.rpc('get_places');

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
      const { error } = await supabase.from('places').insert(placeData);

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

export function useFetchReviews() {
  return useQuery<Array<Review>>('reviews', async (): Promise<Array<Review>> => {
    const { data, error } = await supabase.from('reviews').select(`id,
    content,
    rating,
    place_id,
    created_at, profiles ( email )`);

    if (error) {
      throw new Error(error.message);
    }
    return data;
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, Review>(
    async (reviewData) => {
      const { error } = await supabase.from('reviews').insert(reviewData);

      if (error) {
        throw new Error(error.message);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries("reviews");
      },
    }
  );
}