import { useMutation, useQuery, useQueryClient } from 'react-query'

import { supabase } from '../supabase'
import { type Place, type Review } from '../types'

export function useFetchPlaces() {
  return useQuery<Place[]>('places', async (): Promise<Place[]> => {
    const { data, error } = await supabase.rpc('get_places')

    if (error != null) {
      throw new Error(error.message)
    }
    return data
  })
}

interface createPlacePayload {
  name: string
  content: string
  location: string
}

export function useCreatePlace() {
  const queryClient = useQueryClient()

  return useMutation<unknown, unknown, createPlacePayload>(
    async (placeData) => {
      const { error } = await supabase.from('places').insert(placeData)

      if (error != null) {
        throw new Error(error.message)
      }
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('places')
      }
    }
  )
}

export function useFetchReviews() {
  return useQuery('reviews', async () => {
    const { data, error } = await supabase.from('reviews').select(`id,
    content,
    rating,
    place_id,
    author_id,
    created_at, profiles ( email )`).returns<Review[]>()

    if (error != null) {
      throw new Error(error.message)
    }
    return data
  })
}

interface createReviewPayload {
  content: string,
  rating: number
  place_id: number,
  author_id: number
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation<unknown, unknown, createReviewPayload>(
    async (reviewData) => {
      const { error } = await supabase.from('reviews').insert(reviewData)

      if (error != null) {
        throw new Error(error.message)
      }
    },
    {
      onSuccess: () => {
        void queryClient.invalidateQueries('reviews')
      }
    }
  )
}

interface updatePlacePayload {
  placeId: number;
  placeContent: string;
}

export function useUpdatePlaceContent(id) {
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, updatePlacePayload>(
    async ({ placeContent }) => {
      const { data, error } = await supabase.from('places').update({ content: placeContent })
        .eq('id', id).select().single();

      if (error != null) {
        throw new Error(error.message)
      }

      return data;
    },
    {
      onSuccess: (placeWithUpdatedContent) => {
        queryClient.setQueriesData(['places'], (oldData) => {
          return oldData.map((place) =>
            place.id === id ? { ...place, content: placeWithUpdatedContent.content } : place
          );
        });
      },
    }
  )
}