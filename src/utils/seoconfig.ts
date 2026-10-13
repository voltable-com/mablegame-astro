/**
 * Defines the default SEO configuration for the website.
 */
export const seoconfig = {
	baseURL: "https://www.voltable.com/game/mable/",
	description:
		"Mable game - guess the multiplication",
	type: "website",
	image: {
		url: "https://www.voltable.com/game/mable/favicon-325.png",
		alt: "Yellow rectangular face with eyes and mouth", 
		width: 325,
		height: 325
	},
	siteName: "Mable game - guess the multiplication",
	twitter: {
		card: "summary_large_image",
        site: "@VoltableCom",
        title: "Mable game - guess the multiplication",
        description: "Mable game - guess the multiplication",
        image: "https://www.voltable.com/game/mable/favicon-250.png",
        imageAlt: "Yellow rectangular face with eyes and mouth",
        creator: "@VoltableCom"

	}
} as const
