import type { AccountProps } from "@/interfaces/Account"
import GetPlayerCard, { FetchLatestBan, GetBuddy, GetRank, GetWeaponSkin } from "@/modules/API"
import { Carousel } from "@mantine/carousel"
import { Sparkline } from "@mantine/charts"
import {
  Badge,
  Button,
  Card,
  Flex,
  Group,
  Input,
  Modal,
  Stack,
  Text,
  Tooltip,
  Avatar,
  Box,
  Paper,
  Grid,
  Image,
  Title,
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconPencil, IconTrash, IconLogin, IconUser, IconAlertCircle, IconShoppingCart } from "@tabler/icons-react"
import { useEffect, useState } from "react"
import { WeaponDisplay } from "../WeaponDisplay/WeaponDisplay"
import { Ranks } from "@/interfaces/Ranks"
import { notifications } from "@mantine/notifications"

function convertDateToPastTime(date: string): string {
  const now = new Date()
  const pastDate = new Date(date)
  const diffInMs = now.getTime() - pastDate.getTime()
  const diffInSecs = Math.floor(diffInMs / 1000)
  const diffInMins = Math.floor(diffInSecs / 60)
  const diffInHours = Math.floor(diffInMins / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInMonths = Math.floor(diffInDays / 30)
  const diffInYears = Math.floor(diffInDays / 365)

  if (diffInSecs < 60) return `${diffInSecs}s ago`
  if (diffInMins < 60) return `${diffInMins}m ago`
  if (diffInHours < 24) return `${diffInHours}h ago`
  if (diffInDays < 30) return `${diffInDays}d ago`
  if (diffInMonths < 12) return `${diffInMonths}mo ago`
  return `${diffInYears}y ago`
}
function formatCountdown(expiry: Date): string {
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (days > 0) {
        return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
        return `${hours}h ${minutes}m ${seconds}s`;
    } else {
        return `${minutes}m ${seconds}s`;
    }
}

interface AccountCardProps extends AccountProps {
  onAccountUpdate?: () => void
}

const AccountCard: React.FC<AccountCardProps> = (props) => {
  const [opened, { open, close }] = useDisclosure()
  const [banModalOpened, { open: openBanModal, close: closeBanModal }] = useDisclosure();
  const [accountName, setAccountName] = useState<string>(props.accountName)
  const [playerCard, setPlayerCard] = useState<{ displayIcon: string; largeArt: string; smallArt: string }>()
  const [vandalSkin, setVandalSkin] = useState<{
    displayIcon: string;
    displayName: string;
    fullRender: string;
    buddy?: {
      displayIcon: string;
      displayName: string;
    };
  }>();
  const [phantomSkin, setPhantomSkin] = useState<{     
    displayIcon: string;
    displayName: string;
    fullRender: string;
    buddy?: {
      displayIcon: string;
      displayName: string;
    }; 
  }>();
  const [sheriffSkin, setSheriffSkin] = useState<{ 
    displayIcon: string;
    displayName: string;
    fullRender: string;
    buddy?: {
      displayIcon: string;
      displayName: string;
    }; 
  }>()

  const [rank, setRank] = useState<{
    TierAfterUpdate : number;
    RankedRatingAfterUpdate : number;
    rankImage : string;
  }>();
  const [isBanned, setIsBanned] = useState<boolean>(false)
  const [banExpiry, setBanExpiry] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  const handleLogin = async () => {
    await window.api.loginAccount(props.accountNumber)
    notifications.show(
        {
            title: "Account switched.",
            message: `Loading VALORANT as ${props.riotName}#${props.riotTag}`,
            autoClose: 5000,
            color: "green"
        }
      )
    if (props.onAccountUpdate) {
      props.onAccountUpdate()
    }
  }

  const handleSave = async () => {
    try {
      await window.api.updateAccount(props.accountNumber, { accountName })
      close()
      if (props.onAccountUpdate) {
        props.onAccountUpdate()
      }
    } catch (error) {
      console.error("Error updating account:", error)
    }
  }

  const handleRemove = async () => {
    try {
      await window.api.removeAccount(props.accountNumber)
      if (props.onAccountUpdate) {
        props.onAccountUpdate()
        notifications.show(
            {
                title: "Account removed",
                message: `Successfully removed ${props.riotName}#${props.riotTag}`,
                autoClose: 5000,
                color: "green"
            }
        )
      }
    } catch (err) {
      console.error("Error removing account:", err)
    }
  }

  useEffect(() => {
    const fetchPlayerCard = async () => {
      try {
        const data = await GetPlayerCard(props.loadout.Identity.PlayerCardID)
        setPlayerCard(data.data)
      } catch (error) {
        console.error("Error fetching player card:", error)
      }
    }
    const fetchVandal = async() => {
        try {
            const vandalGun = props.loadout.Guns.find((gun) => 
              gun.ID === "9c82e19d-4575-0200-1a81-3eacf00cf872"
            );
            const skinData = await GetWeaponSkin(vandalGun?.ChromaID || "");
            const buddyData = vandalGun?.CharmID ? 
              await GetBuddy(vandalGun.CharmID) : null;
    
            setVandalSkin({
                ...skinData.data,
                buddy: buddyData?.data
            });
        } catch(error) {
            console.error("Error fetching vandal skin or buddy:", error);
        }
    }
    const fetchPhantom = async() => {
        try{
            const phantomGun = props.loadout.Guns.find((gun) => gun.ID === "ee8e8d15-496b-07ac-e5f6-8fae5d4c7b1a");
            const skinData = await GetWeaponSkin(phantomGun?.ChromaID || "");
            const buddyData = phantomGun?.CharmID ? 
              await GetBuddy(phantomGun.CharmID) : null;

            setPhantomSkin({
                ...skinData.data,
                buddy: buddyData?.data
            });
        }catch(error){
            console.error("Error fetching phantom skin or buddy:", error);
        }
    }
    const fetchSheriff = async() => {
        try{
            const sheriffGun = props.loadout.Guns.find((gun) => gun.ID === "e336c6b8-418d-9340-d77f-7a9e4cfe0702");
            const skinData = await GetWeaponSkin(sheriffGun?.ChromaID || "");
            const buddyData = sheriffGun?.CharmID ?
                await GetBuddy(sheriffGun.CharmID) : null;

            setSheriffSkin({
                ...skinData.data,
                buddy: buddyData?.data
            })
        }catch(err){
            console.error("Error fetching sheriff skin:", err)
        }
    }
    const checkBan = async() => {
        try {
            if(!props.penalties.Penalties.length) return;
            const latestBan = await FetchLatestBan(props.penalties.Penalties);
            const expiryDate = new Date(latestBan.Expiry);
            setIsBanned(expiryDate > new Date());
            setBanExpiry(expiryDate);
        } catch(err) {
            console.error("Error checking for ban:", err);
        }
    }
    
    const fetchRank = async() => {
        try{
            setRank(
                {
                    TierAfterUpdate: props.mmr.LatestCompetitiveUpdate.TierAfterUpdate,
                    RankedRatingAfterUpdate: props.mmr.LatestCompetitiveUpdate.RankedRatingAfterUpdate,
                    rankImage: `https://imgsvc.trackercdn.com/url/max-width(96),quality(66)/https%3A%2F%2Ftrackercdn.com%2Fcdn%2Ftracker.gg%2Fvalorant%2Ficons%2Ftiersv2%2F${props.mmr.LatestCompetitiveUpdate.TierAfterUpdate}.png/image.png`
                }
            )
        }catch(err){
            console.error("Error fetching rank:", err)
        }
    }

    fetchPlayerCard()
    fetchVandal();
    fetchPhantom();
    fetchSheriff();
    checkBan();
    fetchRank();
  }, [props.loadout])

    useEffect(() => {
        if (!banExpiry || !isBanned) return;

        const updateCountdown = () => {
            setCountdown(formatCountdown(banExpiry));
        };

        updateCountdown();

        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [banExpiry, isBanned]);

  return (
    <>
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        sx={(theme) => ({
          backgroundColor: theme.colors.dark[8],
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-5px)",
            boxShadow: theme.shadows.md,
          },
        })}
      >
        <Card.Section>
            <Carousel>
                <Carousel.Slide>
                    <Sparkline
                        w={"100%"}
                        h={100}
                        data={props.ranked.Matches.map((match) => match.RankedRatingAfterUpdate).reverse()}
                        curveType="linear"
                        color="blue.5"
                        fillOpacity={0.6}
                        strokeWidth={2}
                    />
                </Carousel.Slide>
                <Carousel.Slide p={12}>
                    <Flex gap={2} align="center" justify="center">
                        <WeaponDisplay weapon={vandalSkin!} />
                        <WeaponDisplay weapon={phantomSkin!} />
                        <WeaponDisplay weapon={sheriffSkin!} />
                    </Flex>
                </Carousel.Slide>
            </Carousel>
        </Card.Section>

        <Box pos="relative" w={80} mx="auto" mt={-20}>
          <Avatar
            src={playerCard?.displayIcon}
            size={80}
            radius={80}
            sx={(theme) => ({
              border: `4px solid ${theme.colors.dark[8]}`,
              boxShadow: theme.shadows.md,
            })}
          />
          {rank && (
            <Tooltip label={`Rank: ${Ranks[rank.TierAfterUpdate]} - RR: ${rank.RankedRatingAfterUpdate}`} withArrow position="top" sx={(theme) => ({ backgroundColor: theme.colors.dark[6], color: "white" })}>
                <Avatar
                    src={rank?.rankImage}
                    size={30}
                    radius={80}
                    pos="absolute"
                    bottom={-4}
                    right={-4}
                    sx={(theme) => ({
                    border: `2px solid ${theme.colors.dark[8]}`,
                    borderRadius: "40px",
                    backgroundColor: theme.colors.dark[7],
                    })}
                />
            </Tooltip>
          )}
        </Box>
        <Stack align="center">
          <Text size="lg" fw={700}>
            {props.riotName ? `${props.riotName}#${props.riotTag}` : props.accountName}
          </Text>
          <Group gap={3}>
            <Badge color="blue" size="sm">
              {props.region}
            </Badge>
            <Badge color="yellow" size="sm">
              Last used {convertDateToPastTime(props.lastUsed)}
            </Badge>
            {isBanned && (
                <Badge color="red" size="sm">
                    Banned for {countdown}
                </Badge>    
            )}
          </Group>
        </Stack>

        <Paper withBorder p="md" radius="md" mt="md">
          <Flex gap={8} mb={4}>
            <Button leftSection={<IconLogin size={16} />} color="blue" onClick={isBanned ? openBanModal : handleLogin} fullWidth>
              Login
            </Button>
            <Tooltip label="Edit account" withArrow position="top" sx={(theme) => ({ backgroundColor: theme.colors.dark[6], color: "white" })}>
                <Button color="blue" size="sm" variant="light" onClick={open}>
                  <IconPencil size={18} />
                </Button>
            </Tooltip>
            <Tooltip label="Remove account" withArrow position="top" sx={(theme) => ({ backgroundColor: theme.colors.dark[6], color: "white" })}>
                <Button color="red" size="sm" variant="light" onClick={handleRemove}>
                  <IconTrash size={18} />
                </Button>
            </Tooltip>
          </Flex>
        </Paper>
      </Card>

      <Modal opened={opened} onClose={close} title="Edit account" centered>
        <Stack p="md">
          <Input
            leftSection={<IconUser size={16} />}
            placeholder="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.currentTarget.value)}
          />
          <Button color="blue" onClick={handleSave} fullWidth>
            Save Changes
          </Button>
        </Stack>
      </Modal>

      <Modal opened={banModalOpened} onClose={closeBanModal} title="Ban Information" centered>
        <Group p="md" align="center">
            <IconAlertCircle size={24} color="red" />
            <div>
              <Title order={4}>Attention</Title>
              <Text size="sm" color="dimmed">
                Please read the details.
              </Text>
            </div>
          </Group>
          <Text>This account is banned, therefore you cannot queue any games.</Text>
          <Flex gap={4}>
            <Button fullWidth color="blue.5" onClick={handleLogin} mt={8}>
                Continue
            </Button>
            <Button fullWidth color="red.5" onClick={closeBanModal} mt={8}>
                Go Back
            </Button>
          </Flex>
      </Modal>

    </>
  )
}

export default AccountCard

