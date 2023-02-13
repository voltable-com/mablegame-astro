import type { APIRoute } from 'astro';
import { data } from '../../../data/n.json';

const getData = (id: string) => {
  let number = data[id]
  let obj = {
     n1: Buffer.from(String(number[0])).toString('base64'),
     n2: Buffer.from(String(number[1])).toString('base64'),
     f: Buffer.from(String(number[4])).toString('base64')
  }

  return Buffer.from(JSON.stringify(obj)).toString('base64');
}

export const get: APIRoute = ({ params, request }) => {
  const id = params.id;
  return {
    body: JSON.stringify({
      data: getData(id)
    })
  }
};


export async function getStaticPaths() {
  const posts = Array.from(Array(12400).keys()).map(x => x + 1);

  return posts.map((post) => {
    return { params: { id: post } };
  });
}
