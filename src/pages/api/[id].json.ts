import type { APIRoute, GetStaticPaths } from 'astro';
import { data } from '@/data/n.json';

const getData = (id: string) => {
  let number = data[Number(id)]
  let obj = {
     n1: Buffer.from(String(number[0])).toString('base64'),
     n2: Buffer.from(String(number[1])).toString('base64'),
     f: Buffer.from(String(number[4])).toString('base64')
  }

  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

/**
 * Get the data for the given id
 * 
 * @param params 
 * @returns 
 */
export const GET: APIRoute = ({ params }) => {
  const id = params.id as string;
  return new Response(
    JSON.stringify(
      getData(id)
    )
  )
}

/**
 * Generate all static data for our game
 * 
 * @returns 
 */
export const getStaticPaths = (() => {
  const posts = Array.from(Array(12400).keys()).map(x => x + 1);

  return posts.map((post) => {
    return { params: { id: String(post) } };
  });
}) satisfies GetStaticPaths;
