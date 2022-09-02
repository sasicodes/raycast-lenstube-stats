import { ActionPanel, Action, Grid, List, useNavigation } from "@raycast/api";
import { useFetch } from "@raycast/utils";

export type GlobalProtocolStats = {
  totalBurntProfiles: number;
  totalCollects: number;
  totalComments: number;
  totalFollows: number;
  totalMirrors: number;
  totalPosts: number;
  totalProfiles: number;
  totalRevenue: Array<{ value: string; asset: { name: string; symbol: string } }>;
};
const query = `
  query LenstubeStats($request: GlobalProtocolStatsRequest) {
    globalProtocolStats(request: $request) {
      totalProfiles
      totalBurntProfiles
      totalPosts
      totalMirrors
      totalComments
      totalCollects
      totalFollows
      totalRevenue {
        asset {
          name
          symbol
          decimals
          address
        }
        value
      }
    }
    bytesStats: globalProtocolStats(request: { sources: "lenstube-bytes" }) {
      totalPosts
    }
  }
`;

function Revenue({ stats }: { stats: GlobalProtocolStats }) {
  const { pop } = useNavigation();

  return (
    <List
      actions={
        <ActionPanel>
          <ActionPanel.Item title="Go Back" onAction={pop} />
        </ActionPanel>
      }
    >
      {stats.totalRevenue.map((item, i) => (
        <List.Item
          key={i}
          title={item.value}
          subtitle={item.asset.name}
          actions={
            <ActionPanel>
              <Action.CopyToClipboard content={item.value} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

export default function Command() {
  const { isLoading, data } = useFetch<{
    data: { globalProtocolStats: GlobalProtocolStats; bytesStats: GlobalProtocolStats };
  }>("https://api.lens.dev", {
    method: "post",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      operationName: "LenstubeStats",
      query,
      variables: {
        request: { sources: ["lenstube"] },
      },
    }),
  });

  const stats = data?.data?.globalProtocolStats as GlobalProtocolStats;
  const bytesStats = data?.data?.bytesStats as GlobalProtocolStats;

  return (
    <Grid itemSize={Grid.ItemSize.Medium} inset={Grid.Inset.Medium} isLoading={isLoading}>
      {!isLoading && (
        <>
          <Grid.Item
            subtitle="videos"
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={stats.totalPosts.toString()} />
              </ActionPanel>
            }
            content="🎥"
            title={stats.totalPosts.toString()}
          />
          <Grid.Item
            subtitle="comments"
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={stats.totalComments.toString()} />
              </ActionPanel>
            }
            content="💬"
            title={stats.totalComments.toString()}
          />
          <Grid.Item
            subtitle="mirrors"
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={stats.totalMirrors.toString()} />
              </ActionPanel>
            }
            content="🪞"
            title={stats.totalMirrors.toString()}
          />
          <Grid.Item
            subtitle="bytes"
            actions={
              <ActionPanel>
                <Action.CopyToClipboard content={stats.totalPosts.toString()} />
              </ActionPanel>
            }
            content="📺"
            title={bytesStats.totalPosts.toString()}
          />
          <Grid.Item
            subtitle="Lenstube"
            actions={
              <ActionPanel>
                <Action.Push title="View Revenue" target={<Revenue stats={stats} />} />
              </ActionPanel>
            }
            content="🤑"
            title="View Revenue"
          />
        </>
      )}
    </Grid>
  );
}
