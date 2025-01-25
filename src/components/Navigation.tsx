import { Box, Group, ActionIcon, Tooltip, Modal, Text, Button, Stack, Title } from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { IconPlus, IconSearch, IconUser, IconSettings, IconAlertCircle } from "@tabler/icons-react"

interface NavigationProps {
  onAccountUpdate?: () => void
}

const Navigation: React.FC<NavigationProps> = ({ onAccountUpdate }) => {
  const [opened, { open, close }] = useDisclosure(false)

  const handleModalOpen = async() => {
    open();
    const data = await window.api.addNewAccount();
    if(onAccountUpdate){
      onAccountUpdate();
      if(data){
        notifications.show(
          {
            title: "Account Added",
            message: "Your account has been added successfully.",
            color: "green",
          }
        )
      }else{
        notifications.show(
          {
            title: "Error",
            message: "An error occurred while adding your account.",
            color: "red",
          }
        )
      }
    }
  }

  return (
    <>
      <Box
        pos="fixed"
        bottom={20}
        left="96%"
        bg="blue"
        sx={(theme) => ({
          transform: "translateX(-50%)",
          borderRadius: theme.radius.lg,
          boxShadow: theme.shadows.md,
        })}
      >
        <Group p="md">
          <Tooltip label="Add New Account" withArrow position="top" sx={(theme) => ({ backgroundColor: theme.colors.dark[6], color: "white" })}>
            <ActionIcon variant="subtle" color="white" size="lg" onClick={handleModalOpen}>
              <IconPlus size={24} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Box>

      <Modal
        opened={opened}
        onClose={close}
        centered
        withCloseButton={false}
        closeOnClickOutside={false}
        size="md"
        overlayProps={{
          opacity: 0.55,
          blur: 3,
        }}
      >
          <Group p="md" align="center">
            <IconAlertCircle size={24} color="orange" />
            <div>
              <Title order={4}>Attention</Title>
              <Text size="sm" color="dimmed">
                Please follow these steps to add a new account:
              </Text>
            </div>
          </Group>
          <Text>1. Riot Client will now open.</Text>
          <Text>2. Please log in to your account.</Text>
          <Text>3. Ensure the "Stay logged in" option is checked.</Text>
          <Text fw={500}>Once you have completed these steps, click the button below.</Text>
          <Button fullWidth color="red.5" onClick={close} mt={8}>
            I've Logged In
          </Button>
      </Modal>
    </>
  )
}

export default Navigation

