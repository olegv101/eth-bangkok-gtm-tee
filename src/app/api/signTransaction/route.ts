import { TappdClient } from "@phala/dstack-sdk";
import "dotenv/config";
import { privateKeyToAccount } from "viem/accounts";
import { keccak256, http, createPublicClient, createWalletClient } from "viem";
import superjson from "superjson";
import { account, getChain } from "./chains";
import { bountyABI, bountyAddress } from "./Bounty";

const endpoint =
  process.env.DSTACK_SIMULATOR_ENDPOINT || "http://localhost:8090";

export const dynamic = "force-dynamic";

const findTweetText = (data: any): string => {
  try {
    const res =
      data.data.threaded_conversation_with_injections_v2.instructions[0]
        .entries[0].content.itemContent.tweet_results.result.legacy.full_text;
    return res;
  } catch (e) {
    return "";
  }
};

const findViewCount = (data: any): number => {
  if (typeof data === "object" && data !== null) {
    for (const key in data) {
      if (key === "views" && data[key]?.count) {
        return data[key].count; // Return the count if found
      }
      // Recursively search nested objects
      if (typeof data[key] === "object") {
        const result: number = findViewCount(data[key]);
        if (result) return result;
      }
    }
  }
  return 0; // Return 0 in base case
};

const findMultiplier = async (data: any, keyword: string): Promise<number> => {
  const tweetText = findTweetText(data);
  console.log(`Tweet Text: ${tweetText}`);

  const response = await fetch("https://api.red-pill.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer sk-Zxkp30MdyOkjf3AzLXoTRlGtq3pF2LKCO3x4x01NDavyqD9G",
    },
    body: JSON.stringify({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: `Return a score between 0 and 10 that corresponds to the number of times ${keyword} was mentioned in the following tweet. If there are one or more mentions, return a 1, otherwise return a number corresponding to how closely the tweet has to do with ${keyword} even though it does not specifically mention his name. Here is the tweet: ${tweetText}`,
        },
      ],
      temperature: 1,
    }),
  });

  const result = await response.json();
  const score = parseFloat(
    result.choices[0].message.content.match(/\d+(\.\d+)?/)?.[0] || "0"
  );
  return score;
};

async function getViewCount(tweetId: string, keyword: string) {
  const apiResponse = await fetch(
    `https://x.com/i/api/graphql/nBS-WpgA6ZG0CyNHD517JQ/TweetDetail?variables=${encodeURIComponent(
      JSON.stringify({
        focalTweetId: tweetId,
        with_rux_injections: false,
        rankingMode: "Relevance",
        includePromotedContent: true,
        withCommunity: true,
        withQuickPromoteEligibilityTweetFields: true,
        withBirdwatchNotes: true,
        withVoice: true,
      })
    )}&features=${encodeURIComponent(
      JSON.stringify({
        rweb_tipjar_consumption_enabled: true,
        responsive_web_graphql_exclude_directive_enabled: true,
        verified_phone_label_enabled: false,
        creator_subscriptions_tweet_preview_api_enabled: true,
        responsive_web_graphql_timeline_navigation_enabled: true,
        responsive_web_graphql_skip_user_profile_image_extensions_enabled:
          false,
        communities_web_enable_tweet_community_results_fetch: true,
        c9s_tweet_anatomy_moderator_badge_enabled: true,
        articles_preview_enabled: true,
        responsive_web_edit_tweet_api_enabled: true,
        graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
        view_counts_everywhere_api_enabled: true,
        longform_notetweets_consumption_enabled: true,
        responsive_web_twitter_article_tweet_consumption_enabled: true,
        tweet_awards_web_tipping_enabled: false,
        creator_subscriptions_quote_tweet_preview_enabled: false,
        freedom_of_speech_not_reach_fetch_enabled: true,
        standardized_nudges_misinfo: true,
        tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled:
          true,
        rweb_video_timestamps_enabled: true,
        longform_notetweets_rich_text_read_enabled: true,
        longform_notetweets_inline_media_enabled: true,
        responsive_web_enhance_cards_enabled: false,
      })
    )}&fieldToggles=${encodeURIComponent(
      JSON.stringify({
        withArticleRichContentState: true,
        withArticlePlainText: false,
        withGrokAnalyze: false,
        withDisallowedReplyControls: false,
      })
    )}`,
    {
      method: "GET",
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9",
        authorization:
          "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "content-type": "application/json",
        cookie:
          'guest_id=v1%3A172711866704604324; night_mode=2; kdt=Vm1aR9HWJRT5WV8NEFoqF99l6XumPgjyWqe0zSQ1; auth_token=fc3a35ab367775aecbec60bab122f3060533150c; ct0=925f6344746907fbf9c34f6d58c6b573b110c0b5eeeb48287417cba5240e2e01ad43bc2803b2083a2a5078d2385604b8e6c1d34f1e679cf8e7a8ed83bea3af299110b721b8f40aa0c820523c7b797b41; lang=en; twid=u%3D1535438792579948544; d_prefs=MjoxLGNvbnNlbnRfdmVyc2lvbjoyLHRleHRfdmVyc2lvbjoxMDAw; guest_id_marketing=v1%3A172711866704604324; guest_id_ads=v1%3A172711866704604324; personalization_id="v1_C447T0WadS3vSW0WNHtpDw=="',
        dnt: "1",
        priority: "u=1, i",
        "sec-ch-ua": '"Chromium";v="129", "Not=A?Brand";v="8"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
        "x-twitter-active-user": "yes",
        "x-twitter-auth-type": "OAuth2Session",
        "x-twitter-client-language": "en",
        "x-csrf-token":
          "925f6344746907fbf9c34f6d58c6b573b110c0b5eeeb48287417cba5240e2e01ad43bc2803b2083a2a5078d2385604b8e6c1d34f1e679cf8e7a8ed83bea3af299110b721b8f40aa0c820523c7b797b41",
        "x-client-transaction-id":
          "m88P9QH5SK+8WJOq1Ga+6kSIqbWkGO5meO4VgRioKLBQBDjTAEGlR24Guj4sZANwURibWZlv+FQFnO+1LQK5kEjjpxN+mA",
      },
      cache: "no-store",
    }
  );
  const data = await apiResponse.json();
  const multiplier = await findMultiplier(data, keyword);
  const viewCount = Number(findViewCount(data));
  console.log(`Multiplier: ${multiplier}`);
  console.log(`View Count: ${viewCount}`);
  return viewCount * multiplier;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tweetId = searchParams.get("tweetId");
  const chainId = searchParams.get("chainId");
  const keyword = searchParams.get("keyword");
  console.log(`Tweet ID: ${tweetId}`);
  console.log(`Chain ID: ${chainId}`);
  console.log(`Keyword: ${keyword}`);

  if (!tweetId || !chainId || !keyword) {
    return Response.json(
      { error: "Tweet ID, Chain ID, and keyword are required" },
      { status: 400 }
    );
  }

  const chain = getChain(Number(chainId));
  if (!chain) {
    return Response.json(
      { error: "Invalid or unsupported chain ID" },
      { status: 400 }
    );
  }

  try {
    const viewCount = await getViewCount(tweetId, keyword);
    console.log(`Tweet ${tweetId} view count:`, viewCount);

    const gweiAmount = viewCount;
    const bountyAddr = bountyAddress[Number(chainId)];

    if (!bountyAddr) {
      return Response.json(
        { error: "No bounty address configured for this chain" },
        { status: 400 }
      );
    }
    const publicClient = createPublicClient({
      chain: chain,
      transport: http(),
    });
    const walletClient = createWalletClient({
      chain: chain,
      transport: http(),
    });
    // const client = new TappdClient(endpoint);
    // const testDeriveKey = await client.deriveKey("/", "test");
    // const keccakPrivateKey = keccak256(testDeriveKey.asUint8Array());
    let result = {
      derivedPublicKey: account.address,
      to: bountyAddr,
      gweiAmount,
      hash: "",
      receipt: {},
      tweetId,
      viewCount,
    };
    console.log(
      `Sending Transaction with Account ${account.address} to ${bountyAddr} for ${gweiAmount} gwei`
    );
    try {
      // @ts-ignore
      const hash = await walletClient.writeContract({
        account,
        address: bountyAddr,
        abi: bountyABI,
        functionName: "verifyTweet",
        args: [tweetId, viewCount],
      });
      console.log(`Transaction Hash: ${hash}`);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log(`Transaction Status: ${receipt.status}`);
      result.hash = hash;
      result.receipt = receipt;
    } catch (e) {
      return Response.json({ error: e });
    }
    const { json: jsonResult, meta } = superjson.serialize(result);

    return Response.json({ jsonResult });
  } catch (e) {
    return Response.json({ error: e });
  }
}
