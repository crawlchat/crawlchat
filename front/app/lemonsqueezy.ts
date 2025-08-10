export type LemonSqueezySubscription = {
  data: {
    id: string;
    attributes: {
      product_name: string;
      status: "active" | "cancelled" | "expired";
      urls: {
        customer_portal: string;
      };
    };
  };
};

export const getSubscription = async (
  subscriptionId: string
): Promise<LemonSqueezySubscription> => {
  const res = await fetch(
    `https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`,
    {
      headers: {
        Accept: "application/vnd.api+json",
        ContentType: "application/vnd.api+json",
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
    }
  );

  return res.json();
};
